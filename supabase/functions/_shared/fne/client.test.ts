import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { callFne, classifyHttpStatus } from "./client.ts";

/** Demarre un serveur mock sur un port libre et retourne son URL + une fonction d'arret. */
function startMockServer(handler: (req: Request) => Response | Promise<Response>) {
  const controller = new AbortController();
  const server = Deno.serve(
    { port: 0, signal: controller.signal, onListen: () => {} },
    handler
  );
  const port = (server.addr as Deno.NetAddr).port;
  return {
    url: `http://127.0.0.1:${port}/sign`,
    close: async () => {
      controller.abort();
      await server.finished;
    },
  };
}

Deno.test("classifyHttpStatus - tableau §6 de la spec", () => {
  assertEquals(classifyHttpStatus(400), { classification: "permanent", errorClass: "http_400" });
  assertEquals(classifyHttpStatus(401), { classification: "retryable", errorClass: "http_401" });
  assertEquals(classifyHttpStatus(500), { classification: "retryable", errorClass: "http_500" });
  assertEquals(classifyHttpStatus(418), { classification: "permanent", errorClass: "http_other" });
});

Deno.test("callFne - 201 => success, corps JSON parse", async () => {
  const mock = startMockServer(() => new Response(JSON.stringify({ reference: "ABC123" }), { status: 201 }));
  try {
    const result = await callFne(mock.url, "test-key", { foo: "bar" });
    assertEquals(result.outcome, "success");
    if (result.outcome === "success") {
      assertEquals(result.status, 201);
      assertEquals(result.body, { reference: "ABC123" });
    }
  } finally {
    await mock.close();
  }
});

Deno.test("callFne - 400 => permanent, aucun retry attendu", async () => {
  const mock = startMockServer(
    () => new Response(JSON.stringify({ message: "Point of sale is not valid" }), { status: 400 })
  );
  try {
    const result = await callFne(mock.url, "test-key", {});
    assertEquals(result.outcome, "permanent");
    if (result.outcome !== "success") assertEquals(result.errorClass, "http_400");
  } finally {
    await mock.close();
  }
});

Deno.test("callFne - 401 => retryable (le worker gere le 'une seule fois')", async () => {
  const mock = startMockServer(() => new Response(JSON.stringify({ message: "Invalid key" }), { status: 401 }));
  try {
    const result = await callFne(mock.url, "bad-key", {});
    assertEquals(result.outcome, "retryable");
    if (result.outcome !== "success") assertEquals(result.errorClass, "http_401");
  } finally {
    await mock.close();
  }
});

Deno.test("callFne - 500 => retryable", async () => {
  const mock = startMockServer(() => new Response(JSON.stringify({ message: "Internal error" }), { status: 500 }));
  try {
    const result = await callFne(mock.url, "test-key", {});
    assertEquals(result.outcome, "retryable");
    if (result.outcome !== "success") assertEquals(result.errorClass, "http_500");
  } finally {
    await mock.close();
  }
});

Deno.test("callFne - connect timeout (rien recu) => retryable, jamais de second POST implicite", async () => {
  // Le serveur attend 200ms avant de repondre ; on force un timeout de connexion a 20ms.
  const mock = startMockServer(async () => {
    await new Promise((r) => setTimeout(r, 200));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  try {
    const result = await callFne(mock.url, "test-key", {}, { connectTimeoutMs: 20 });
    assertEquals(result.outcome, "retryable");
    if (result.outcome !== "success") {
      assertEquals(result.errorClass, "connect_timeout");
      assertEquals(result.status, null);
    }
  } finally {
    await mock.close();
  }
});

Deno.test("callFne - connexion refusee (port ferme) => retryable / connection_error", async () => {
  const result = await callFne("http://127.0.0.1:65535/sign", "test-key", {}, { connectTimeoutMs: 2000 });
  assertEquals(result.outcome, "retryable");
  if (result.outcome !== "success") assertEquals(result.errorClass, "connection_error");
});

Deno.test("callFne - read timeout (en-tetes recus, corps jamais fini) => indeterminate, AUCUN retry - test critique §12", async () => {
  const mock = startMockServer(() => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Les en-tetes partent immediatement (status 200) mais le corps ne finit jamais
        // avant le timeout de lecture : c'est exactement le scenario "etat indetermine".
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode('{"reference":"late"}'));
          controller.close();
        }, 300);
      },
    });
    return new Response(stream, { status: 200 });
  });
  try {
    const result = await callFne(mock.url, "test-key", {}, { readTimeoutMs: 30 });
    assertEquals(result.outcome, "indeterminate");
    if (result.outcome !== "success") {
      assertEquals(result.errorClass, "read_timeout");
      assertEquals(result.status, 200); // les en-tetes ont bien ete recus
    }
  } finally {
    await mock.close();
  }
});
