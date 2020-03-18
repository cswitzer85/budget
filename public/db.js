let db;
// request opens a budget database with version number 1
const request = indexedDB.open("budget", 1);
// if budget does not exist or version is lower than the above stated number, upgrade is needed and this will run
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
// if budget is opened successfully this will run
request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};
// if ther was an error in trying to open budget, the error code is logged to the console
request.onerror = function(event) {
  console.log("Oh, blunder! " + event.target.errorCode);
};
// this function saves the transaction data to the object store
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}
// this functino checks the db
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
// all data from the object store
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");

          const store = transaction.objectStore("pending");

          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
