let timeoutPesquisa;

// ==========================================
// SUGESTÕES DE CIDADES
// ==========================================

document.getElementById("cidade").addEventListener("input", function () {

const texto = this.value.trim();

clearTimeout(timeoutPesquisa);

if (texto.length < 2) {

    document.getElementById("sugestoes").innerHTML = "";

    return;
}

// Espera um pouco antes de consultar a API
timeoutPesquisa = setTimeout(() => {

    buscarSugestoes(texto);

}, 400);

});

async function buscarSugestoes(texto) {

const sugestoes = document.getElementById("sugestoes");

try {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=6&language=pt&format=json`;

    const resposta = await fetch(url);

    const dados = await resposta.json();

    sugestoes.innerHTML = "";

    if (!dados.results) {
        return;
    }

    dados.results.forEach(local => {

        const div = document.createElement("div");

        div.className = "sugestao";

        const pais = local.country || "";

        const regiao = local.admin1 || "";

        div.innerHTML = `
            <strong>📍 ${local.name}</strong>
            <small>
                ${regiao ? regiao + ", " : ""}${pais}
            </small>
        `;

        div.addEventListener("click", function () {

            document.getElementById("cidade").value =
                local.name;

            sugestoes.innerHTML = "";

            buscarClimaPorCoordenadas(
                local
            );

        });

        sugestoes.appendChild(div);

    });

} catch (erro) {

    console.log(
        "Erro ao carregar sugestões:",
        erro
    );

}

}

// ==========================================
// BUSCAR CLIMA PELO NOME
// ==========================================

async function buscarClima() {

const cidade =
    document.getElementById("cidade").value.trim();

const mensagem =
    document.getElementById("mensagem");

const clima =
    document.getElementById("clima");

const sugestoes =
    document.getElementById("sugestoes");


if (cidade === "") {

    mensagem.textContent =
        "Digite o nome de uma cidade.";

    clima.style.display = "none";

    return;
}


sugestoes.innerHTML = "";

mensagem.textContent =
    "A procurar informações...";


try {

    const geoURL =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

    const geoResposta =
        await fetch(geoURL);


    if (!geoResposta.ok) {

        throw new Error(
            "Erro na pesquisa da cidade."
        );

    }


    const geoDados =
        await geoResposta.json();


    if (
        !geoDados.results ||
        geoDados.results.length === 0
    ) {

        throw new Error(
            "Cidade não encontrada."
        );

    }


    const local =
        geoDados.results[0];


    await buscarClimaPorCoordenadas(local);


} catch (erro) {

    mensagem.textContent =
        erro.message;

    clima.style.display =
        "none";

}

}

// ==========================================
// BUSCAR CLIMA PELAS COORDENADAS
// ==========================================

async function buscarClimaPorCoordenadas(local) {

const mensagem =
    document.getElementById("mensagem");

const clima =
    document.getElementById("clima");


mensagem.textContent =
    "A carregar o clima...";


try {

    const latitude =
        local.latitude;

    const longitude =
        local.longitude;


    const climaURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto&forecast_days=5`;


    const climaResposta =
        await fetch(climaURL);


    if (!climaResposta.ok) {

        throw new Error(
            "Erro ao obter dados do clima."
        );

    }


    const dados =
        await climaResposta.json();


    mostrarClima(
        local,
        dados
    );


    mensagem.textContent = "";

    clima.style.display =
        "block";


} catch (erro) {

    mensagem.textContent =
        erro.message;

    clima.style.display =
        "none";

}

}

// ==========================================
// MOSTRAR CLIMA
// ==========================================

function mostrarClima(local, dados) {

const atual =
    dados.current;


document.getElementById(
    "nomeCidade"
).textContent =
    `${local.name}, ${local.country}`;


document.getElementById(
    "temperatura"
).textContent =
    Math.round(
        atual.temperature_2m
    );


document.getElementById(
    "sensacao"
).textContent =
    `${Math.round(
        atual.apparent_temperature
    )} °C`;


document.getElementById(
    "humidade"
).textContent =
    `${atual.relative_humidity_2m}%`;


document.getElementById(
    "vento"
).textContent =
    `${Math.round(
        atual.wind_speed_10m
    )} km/h`;


document.getElementById(
    "descricao"
).textContent =
    obterDescricao(
        atual.weather_code
    );


document.getElementById(
    "icone"
).textContent =
    obterIcone(
        atual.weather_code
    );


document.getElementById(
    "data"
).textContent =
    new Date().toLocaleDateString(
        "pt-PT",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );


mostrarPrevisao(
    dados.daily
);

}

// ==========================================
// PREVISÃO
// ==========================================

function mostrarPrevisao(daily) {

const previsao =
    document.getElementById(
        "previsao"
    );


previsao.innerHTML = "";


for (
    let i = 0;
    i < daily.time.length;
    i++
) {

    const data =
        new Date(
            daily.time[i] +
            "T00:00:00"
        );


    const dia =
        data.toLocaleDateString(
            "pt-PT",
            {
                weekday: "short",
                day: "numeric"
            }
        );


    const div =
        document.createElement(
            "div"
        );


    div.className = "dia";


    div.innerHTML = `

        <strong>${dia}</strong>

        <div class="icone">
            ${obterIcone(
                daily.weather_code[i]
            )}
        </div>

        <div class="max">
            ${Math.round(
                daily.temperature_2m_max[i]
            )}°C
        </div>

        <div class="min">
            ${Math.round(
                daily.temperature_2m_min[i]
            )}°C
        </div>

    `;


    previsao.appendChild(div);

}

}

// ==========================================
// DESCRIÇÕES DO CLIMA
// ==========================================

function obterDescricao(codigo) {

const descricoes = {

    0: "Céu limpo",

    1: "Principalmente limpo",

    2: "Parcialmente nublado",

    3: "Nublado",

    45: "Nevoeiro",

    48: "Nevoeiro com geada",

    51: "Chuvisco leve",

    53: "Chuvisco moderado",

    55: "Chuvisco intenso",

    61: "Chuva leve",

    63: "Chuva moderada",

    65: "Chuva forte",

    71: "Neve leve",

    73: "Neve moderada",

    75: "Neve forte",

    80: "Aguaceiros leves",

    81: "Aguaceiros moderados",

    82: "Aguaceiros fortes",

    95: "Trovoada",

    96: "Trovoada com granizo",

    99: "Trovoada forte com granizo"

};


return descricoes[codigo]
    || "Condição desconhecida";

}

// ==========================================
// ÍCONES
// ==========================================

function obterIcone(codigo) {

if (codigo === 0)
    return "☀️";


if ([1, 2].includes(codigo))
    return "🌤️";


if (codigo === 3)
    return "☁️";


if ([45, 48].includes(codigo))
    return "🌫️";


if (
    [51, 53, 55, 61, 63, 65]
    .includes(codigo)
)
    return "🌧️";


if (
    [71, 73, 75]
    .includes(codigo)
)
    return "❄️";


if (
    [80, 81, 82]
    .includes(codigo)
)
    return "🌦️";


if (
    [95, 96, 99]
    .includes(codigo)
)
    return "⛈️";


return "🌤️";

}

// ==========================================
// ENTER PARA PESQUISAR
// ==========================================

document
.getElementById("cidade")
.addEventListener(
"keypress",
function(event) {

        if (event.key === "Enter") {

            buscarClima();

        }

    }
);

// ==========================================
// FECHAR SUGESTÕES AO CLICAR FORA
// ==========================================

document.addEventListener(
"click",
function(event) {

    const campo =
        document.getElementById(
            "cidade"
        );

    const sugestoes =
        document.getElementById(
            "sugestoes"
        );


    if (
        event.target !== campo &&
        !sugestoes.contains(
            event.target
        )
    ) {

        sugestoes.innerHTML = "";

    }

}

);