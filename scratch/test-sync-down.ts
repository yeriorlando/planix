// Mock localStorage and window
const store: Record<string, string> = {};
(global as any).window = {
  location: {
    hostname: "localhost"
  }
};
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: any) => { store[key] = String(val); },
  removeItem: (key: string) => { delete store[key]; }
};

// Mock fetch
const realFetch = fetch;
(global as any).fetch = async function(url: string, init: any) {
  console.log(`[Fetch Request] ${init?.method || "GET"} ${url}`);
  try {
    const res = await realFetch(url, init);
    console.log(`[Fetch Response] Status: ${res.status}`);
    return res;
  } catch (err) {
    console.error(`[Fetch Error]`, err);
    throw err;
  }
};

// Set active user in mocked localStorage
const mockUser = {
  id: "03526346-2103-4fa3-b832-17f134dc482b",
  email: "yeriorlandotic@gmail.com",
  nombre: "orlando perez"
};
localStorage.setItem("plx:user", JSON.stringify(mockUser));
localStorage.setItem("plx:session", JSON.stringify({ user_id: mockUser.id, iniciado_en: new Date().toISOString() }));

async function run() {
  try {
    console.log("Loading sync module...");
    const syncModule = await import("../src/lib/supabase/sync");
    console.log("Sync module loaded. Starting syncDownSupabaseToLocalStorage...");
    await syncModule.syncDownSupabaseToLocalStorage(mockUser.id);
    console.log("Sync down completed successfully!");
    console.log("Classrooms in localStorage:", localStorage.getItem("plx:classrooms"));
    console.log("Students in localStorage:", localStorage.getItem("plx:students"));
  } catch (err) {
    console.error("Sync test failed:", err);
  }
}

run();
