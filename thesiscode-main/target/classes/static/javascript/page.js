const firstTabLink = document.getElementById("first-tab-link");
const secondTabLink = document.getElementById("second-tab-link");
const thirdTabLink = document.getElementById("third-tab-link");

if (sessionStorage.getItem("sessionId") == null) {
  fetch("/initialize_session", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("sessionId", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

if (sessionStorage.getItem("isProcessed") == "true") {
  activateTabs();
} else {
  deactivateTabs();
}

function activateTabs() {
  document.body.classList.remove("locked-links");

  let second_tab = document.getElementById("second-tab");
  second_tab.classList.remove("locked-tab");
  second_tab.classList.add("unlocked-tab");
  document.getElementById("second-tab-link").setAttribute("href", "/analysis");

  let third_tab = document.getElementById("third-tab");
  third_tab.classList.remove("locked-tab");
  third_tab.classList.add("unlocked-tab");
  document.getElementById("third-tab-link").setAttribute("href", "/tree");

  sessionStorage.setItem("areTabsActivated", "true");
}

function deactivateTabs() {
  document.body.classList.remove("unlocked-links");

  let second_tab = document.getElementById("second-tab");
  second_tab.classList.remove("unlocked-tab");
  second_tab.classList.add("locked-tab");
  document.getElementById("second-tab-link").setAttribute("href", "/");

  let third_tab = document.getElementById("third-tab");
  third_tab.classList.remove("unlocked-tab");
  third_tab.classList.add("locked-tab");
  document.getElementById("third-tab-link").setAttribute("href", "/");

  sessionStorage.setItem("areTabsActivated", false);
}

sessionStorage.setItem("isLoaded", false);

firstTabLink.addEventListener("click", () => {
  sessionStorage.setItem("isLoaded", true);
});

secondTabLink.addEventListener("click", () => {
  sessionStorage.setItem("isLoaded", true);
});

thirdTabLink.addEventListener("click", () => {
  sessionStorage.setItem("isLoaded", true);
});

window.addEventListener("unload", function (event) {
  if (sessionStorage.getItem("isLoaded") === "false") {
    fetch("/end_session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: sessionStorage.getItem("sessionId"),
    });
  }
});

if (sessionStorage.getItem("isProcessed") == "true") {
  const second_tab_link = document.getElementById("second-tab-link");
  second_tab_link.href = "/analysis";
  const third_tab_link = document.getElementById("third-tab-link");
  third_tab_link.href = "/tree";
} else {
  const second_tab_link = document.getElementById("second-tab-link");
  second_tab_link.href = "/index";
  const third_tab_link = document.getElementById("third-tab-link");
  third_tab_link.href = "/index";
}
