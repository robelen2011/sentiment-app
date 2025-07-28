let comments = JSON.parse(localStorage.getItem("comments")) || []; // Cargar comentarios del localStorage
let commentCount = comments.length; // Establece la cantidad inicial de comentarios

document.getElementById("login-form");
document.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevenir el envío del formulario

  login();
});

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "alumno" && password === "alumno") {
    window.location.href = "/web/alumno.html"; // Redirige a la página de comentarios
  } else if (username === "docente" && password === "docente") {
    window.location.href = "/web/docente.html"; // Redirige a la página de docentes
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}

function submitComment() {
  const commentText = document.getElementById("comment").value;
  const materia = document.getElementById("materias").value;
  if (commentText) {
    analyzeSentiment(commentText, materia)
      .then(() => {
        console.log("No se pudo enviar el comentario");
        document.getElementById("comment").value = "";
        showAlert("No se pudo enviar el mensaje.");
        // Limpiar el campo de entrada
      })
      .catch(() => {
        console.log("Comentario enviado con éxito");
        document.getElementById("comment").value = "";
        showAlert(
          "¡Gracias por tu comentario! <br> </br>  ¡Tu opinión ayudara a hacer de nuestras clases una mejor experiencia! "
        );
        // Incrementar el contador de comentarios y actualizar en localStorage
        commentCount++;
        localStorage.setItem("commentCount", commentCount);
      });
  } else {
    console.log("El campo de comentario está vacío");
  }
}

function analyzeSentiment(text, materia) {
  return fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, materia }),
  })
    .then((response) => response.json())
    .then((data) => {
      const commentResult = {
        text: text,
        materia: materia,
        sentiment: data.label,
        score: data.score,
      };
      comments.push(commentResult);
      localStorage.setItem("comments", JSON.stringify(comments)); // Guardar comentarios en localStorage
      displayComments();
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error; // Lanza el error para capturarlo en submitComment
    });
}

function showAlert(message) {
  const modal = document.getElementById("alertModal");
  const modalMessage = document.getElementById("modal-message");
  modalMessage.innerHTML = message;
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("alertModal");
  modal.style.display = "none";
}

// Para cerrar el modal cuando el usuario hace clic fuera del contenido
window.onclick = function (event) {
  const modal = document.getElementById("alertModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function openHistorialModal() {
  document.getElementById("historialModal").style.display = "block";
  displayComments(); // Llamar a displayComments para mostrar los comentarios en el modal
}

function closeHistorialModal() {
  document.getElementById("historialModal").style.display = "none";
}

// Cerrar el modal cuando se hace clic fuera de él
window.onclick = function (event) {
  const historialModal = document.getElementById("historialModal");
  if (event.target === historialModal) {
    historialModal.style.display = "none";
  }
};

function updateSentimentStats() {
  const totalComments = comments.length;
  const expectedComments = 30; // Número esperado de comentarios (30 estudiantes)
  const positiveComments = comments.filter(
    (comment) => comment.sentiment === "positivo"
  ).length;
  const negativeComments = comments.filter(
    (comment) => comment.sentiment === "negativo"
  ).length;
  const neutralComments = comments.filter(
    (comment) => comment.sentiment === "neutro"
  ).length;

  const positivePercentage = ((positiveComments / totalComments) * 100).toFixed(
    2
  );
  const negativePercentage = ((negativeComments / totalComments) * 100).toFixed(
    2
  );
  const neutralPercentage = ((neutralComments / totalComments) * 100).toFixed(
    2
  );

  document.getElementById("positive-percentage").textContent =
    positivePercentage + "%";
  document.getElementById("negative-percentage").textContent =
    negativePercentage + "%";
  document.getElementById("neutral-percentage").textContent =
    neutralPercentage + "%";

  const participationPercentage = (
    (totalComments / expectedComments) *
    100
  ).toFixed(2);
  setPercentage(participationPercentage);
}

function displayComments() {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = ""; // Limpiar la lista antes de mostrar

  comments.forEach((commentResult) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${commentResult.text}</span> - <span>${commentResult.materia}</span> - <span class="sentiment">Resultado del análisis: ${commentResult.sentiment}</span>`;
    commentsList.appendChild(li);
  });

  updateSentimentStats();
}

// Para cargar los comentarios al abrir la página docente
if (document.getElementById("comments-list")) {
  displayComments();
}

function logout() {
  window.location.href = "/web/index.html"; // Redirige a la página de inicio de sesión
}

function clearComments() {
  localStorage.removeItem("comments"); // Elimina la clave "comments" del localStorage
  comments = []; // Resetea el array de comentarios
  updateCommentCount(0); // Reinicia el contador de comentarios a "0" en la página
  displayComments(); // Actualiza la interfaz
}

// Para cargar los comentarios al abrir la página docente
if (document.getElementById("comments-list")) {
  displayComments();
}

function updateCommentCount(count) {
  document.getElementById("comment-count").textContent = `${count}`;
}

// Para cargar los comentarios al abrir la página docente
if (document.getElementById("comments-list")) {
  displayComments();
}
// Al cargar la página de docentes, actualizar el contador de comentarios
if (document.getElementById("comment-count")) {
  updateCommentCount(commentCount);
}

function setPercentage(percentage) {
  const circle = document.querySelector("circle");
  const numberDisplay = document.querySelector(".number"); // Calcular el nuevo valor de stroke-dashoffset basado en el porcentaje
  const dashOffset = 450 - (450 * percentage) / 100;
  circle.style.strokeDashoffset = dashOffset; // Actualizar el texto del porcentaje
  numberDisplay.innerText = `${percentage}%`;
}
// Para cargar los comentarios al abrir la página

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("comments-list")) {
    displayComments();
  }
  if (document.getElementById("comment-count")) {
    updateCommentCount(commentCount);
  }
});