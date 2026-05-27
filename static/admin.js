async function actualizarRegistros() {
    const response = await fetch("/api/registros");

    if (!response.ok) {
        return;
    }

    const registros = await response.json();
    const tbody = document.querySelector("#tablaRegistros tbody");

    tbody.innerHTML = "";

    registros.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${r.empleado}</td>
            <td>${r.local}</td>
            <td>${r.fecha}</td>
        `;
        tbody.appendChild(tr);
    });
}

setInterval(actualizarRegistros, 5000);