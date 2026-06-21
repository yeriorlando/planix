// Mock localStorage and window
const store = {};
global.window = {
  location: {
    hostname: "localhost"
  }
};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

// Mock fetch
const realFetch = fetch;
global.fetch = async function(url, init) {
  // Let's print the outgoing fetches
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
    // Dynamic import of the sync module
    const syncModule = await import("../src/lib/supabase/sync.js");
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
