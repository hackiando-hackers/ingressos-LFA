const screens = ["filmes", "horarios", "assentos", "ingressos", "resumo", "pagamento", "conclusao"];
let currentIndex = 0;

function renderScreen(name) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const screenDiv = document.createElement("div");
  screenDiv.className = "screen active";

  if (name === "horarios") {
    const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie")) || { title: "Filme" };
    const horarios = ["14:00", "16:30", "19:00", "21:30"];
    let selectedHorario = null;

    const horarioButtons = horarios
      .map((horario) => `<button class="horario-btn" data-time="${horario}">${horario}</button>`)
      .join("");

    screenDiv.innerHTML = `
      <h2>Escolha o horário para: ${selectedMovie.title}</h2>
      <div class="horarios">${horarioButtons}</div>
      <div class="controls">
        <button onclick="goBack()">Voltar</button>
        <button onclick="cancel()">Cancelar</button>
        <button id="avancarBtn" disabled>Avançar</button>
      </div>
    `;

    app.appendChild(screenDiv);

    document.querySelectorAll(".horario-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedHorario = btn.getAttribute("data-time");
        localStorage.setItem("selectedHorario", JSON.stringify(selectedHorario));

        document.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        document.getElementById("avancarBtn").disabled = false;
        document.getElementById("avancarBtn").onclick = next;
      });
    });
    return;
  }

  if (name === "assentos") {
    const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie")) || {};
    const selectedHorario = JSON.parse(localStorage.getItem("selectedHorario")) || "";
    const rows = ["A", "B", "C", "D", "E"];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];
    const occupiedSeats = ["A2", "A3", "B5", "C1"];
    let selectedSeats = [];

    let gridHTML = '<div class="screen-label">TELA AQUI</div><div class="seats-grid">';
    rows.forEach(row => {
      cols.forEach(col => {
        const seatId = `${row}${col}`;
        const isOccupied = occupiedSeats.includes(seatId);
        gridHTML += `
          <div 
            class="seat ${isOccupied ? 'occupied' : ''}" 
            data-seat="${seatId}" 
            ${isOccupied ? 'data-disabled="true"' : ''}
          >${seatId}</div>
        `;
      });
    });
    gridHTML += '</div>';

    screenDiv.innerHTML = `
      <h2>Escolha seus assentos</h2>
      <p>${selectedMovie.title} - ${selectedHorario}</p>
      ${gridHTML}
      <div class="controls">
        <button onclick="goBack()">Voltar</button>
        <button onclick="cancel()">Cancelar</button>
        <button id="avancarBtn" disabled>Avançar</button>
      </div>
    `;

    app.appendChild(screenDiv);

    document.querySelectorAll(".seat:not(.occupied)").forEach(seat => {
      seat.addEventListener("click", () => {
        const seatId = seat.getAttribute("data-seat");
        if (selectedSeats.includes(seatId)) {
          selectedSeats = selectedSeats.filter(s => s !== seatId);
          seat.classList.remove("selected");
        } else {
          selectedSeats.push(seatId);
          seat.classList.add("selected");
        }

        localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));

        document.getElementById("avancarBtn").disabled = selectedSeats.length === 0;
        if (selectedSeats.length > 0) {
          document.getElementById("avancarBtn").onclick = next;
        }
      });
    });
    return;
  }

  if (name === "ingressos") {
    const selectedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];
    const tipos = ["Inteira", "Meia", "Idoso"];
    let ingressosSelecionados = [];

    const selectsHTML = selectedSeats
      .map(assento => `
        <div class="ingresso-row">
          <span>Assento ${assento}</span>
          <select data-assento="${assento}">
            <option value="">Selecione</option>
            ${tipos.map(t => `<option value="${t}">${t}</option>`).join("")}
          </select>
        </div>
      `).join("");

    screenDiv.innerHTML = `
      <h2>Tipo de Ingresso</h2>
      <p>Defina o tipo de ingresso para cada assento selecionado.</p>
      <div class="ingressos-list">${selectsHTML}</div>
      <div class="controls">
        <button onclick="goBack()">Voltar</button>
        <button onclick="cancel()">Cancelar</button>
        <button id="avancarBtn" disabled>Avançar</button>
      </div>
    `;

    app.appendChild(screenDiv);

    const selects = document.querySelectorAll("select");
    selects.forEach(select => {
      select.addEventListener("change", () => {
        ingressosSelecionados = Array.from(selects).map(sel => ({
          assento: sel.getAttribute("data-assento"),
          tipo: sel.value
        }));

        const todosSelecionados = ingressosSelecionados.every(i => i.tipo !== "");
        document.getElementById("avancarBtn").disabled = !todosSelecionados;

        if (todosSelecionados) {
          localStorage.setItem("ingressos", JSON.stringify(ingressosSelecionados));
          document.getElementById("avancarBtn").onclick = next;
        }
      });
    });
    return;
  }

  if (name === "resumo") {
    const filme = JSON.parse(localStorage.getItem("selectedMovie")) || {};
    const horario = JSON.parse(localStorage.getItem("selectedHorario")) || "";
    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    const precos = {
      "Inteira": 24.0,
      "Meia": 12.0,
      "Idoso": 10.0,
    };

    let total = 0;
    const listaIngressos = ingressos.map(i => {
      const valor = precos[i.tipo];
      total += valor;
      return `<li>${i.assento} - ${i.tipo} (R$ ${valor.toFixed(2)})</li>`;
    }).join("");

    screenDiv.innerHTML = `
      <h2>Resumo da Compra</h2>
      <p><strong>Filme:</strong> ${filme.title}</p>
      <p><strong>Horário:</strong> ${horario}</p>
      <p><strong>Ingressos:</strong></p>
      <ul class="resumo-list">${listaIngressos}</ul>
      <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
      <div class="controls">
        <button onclick="goBack()">Voltar</button>
        <button onclick="cancel()">Cancelar</button>
        <button onclick="next()">Avançar</button>
      </div>
    `;

    app.appendChild(screenDiv);
    return;
  }
}

function next() {
  if (currentIndex < screens.length - 1) {
    currentIndex++;
    renderScreen(screens[currentIndex]);
  }
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex--;
    renderScreen(screens[currentIndex]);
  }
}

function cancel() {
  if (confirm("Deseja cancelar sua compra?")) {
    currentIndex = 0;
    renderScreen(screens[currentIndex]);
  }
}

// Inicializa a primeira tela
renderScreen(screens[currentIndex]);
