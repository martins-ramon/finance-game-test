# 🦉 Mundo da Poupança — Aventura Financeira

Jogo educativo em **3D (Three.js/WebGL) + JavaScript puro** (sem frameworks de UI, sem etapa de build), criado como trabalho escolar de Matemática Financeira do 6º ano. O objetivo é ensinar, de forma lúdica, os conceitos de **poupança com juros compostos** e **investimento em ações** (risco, retorno e diversificação), num mundo aberto 3D visto em câmera de terceira pessoa atrás do personagem.

## Como jogar

- **Setas ou WASD**: andar pelo mundo
- **E** ou **Enter**: interagir (entrar em um local, avançar diálogo)
- **☀️ Avançar Dia** (botão no topo): passa um dia no jogo — aplica juros da poupança, atualiza os preços das ações e libera o Trabalhinho de novo
- **🦉** (botão no topo): reabre dicas do Professor Coruja a qualquer momento
- A câmera fica em 3ª pessoa, sempre atrás do personagem, virando automaticamente para a direção que ele está andando

### Locais do mapa

| Local | O que faz |
|---|---|
| 💼 Trabalhinho | Minigame de coletar moedas para ganhar seu primeiro dinheiro (1x por dia) |
| 🏦 Banco | Depositar/sacar dinheiro na poupança, que rende juros compostos a cada dia |
| 📈 Bolsa de Valores | Comprar e vender ações de 4 empresas fictícias com perfis de risco diferentes |
| 🛍️ Loja | Comprar roupas para o personagem e itens de decoração para a casa |
| 🏠 Casa | Ver as decorações compradas e dormir (avança o dia) |

O progresso é salvo automaticamente no `localStorage` do navegador.

## Rodando no Replit

Este projeto é **HTML/CSS/JS estático**, sem etapa de build. A única dependência externa é a biblioteca **Three.js**, carregada via CDN (`<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">` no `index.html`) — o Repl precisa ter acesso à internet ao rodar (o normal em qualquer Repl).

**Opção recomendada:** crie um Repl usando o template **"HTML, CSS, JS"**. O botão "Run" do Replit já serve o `index.html` da raiz automaticamente — não é necessário nenhum passo extra.

**Alternativa (template Node.js):** se o Repl usado for do tipo Node.js, adicione um pequeno servidor estático (usando apenas os módulos nativos `http`/`fs`, sem instalar dependências) e configure o `.replit` para rodá-lo com `node server.js`. O jogo em si continua sendo só HTML/CSS/JS + Three.js via CDN.

## Rodando localmente

Basta servir os arquivos estaticamente, por exemplo:

```bash
python3 -m http.server 8080
```

E acessar `http://localhost:8080` no navegador.

## Estrutura do projeto

```
index.html          Estrutura da página, HUD e painéis (modais)
css/style.css        Estilo visual cartoon
js/config.js         Constantes do jogo (tamanho do mapa, cores, taxas)
js/utils.js          Funções utilitárias (formatação de dinheiro, salvar/carregar)
js/gameState.js       Estado central do jogo e avanço de dia
js/map.js            Mapa (tiles) e locais (prédios)
js/input.js          Captura de teclado
js/player.js          Movimento e colisão do jogador
js/render.js          Cena 3D (Three.js): mundo, prédios, personagem e câmera em 3ª pessoa
js/dialogue.js         Diálogos do Professor Coruja
js/bank.js            Lógica da poupança (juros compostos)
js/stockMarket.js      Lógica da Bolsa de Valores (empresas fictícias)
js/shop.js            Lógica da loja de itens
js/job.js             Minigame de trabalho
js/ui.js              HUD e painéis de interação
js/main.js             Inicialização e loop principal do jogo
```

## Conceitos de matemática financeira no jogo

- **Juros compostos**: `Montante = Capital × (1 + taxa)^dias`. No jogo a taxa é de 1% ao dia — bem exagerada de propósito, para que o crescimento fique visível numa sessão de aula. Na vida real, a poupança rende bem menos, mas o princípio matemático é o mesmo.
- **Risco e retorno**: as 4 empresas da Bolsa têm volatilidades diferentes (risco baixo, médio, alto e muito alto) — quanto maior o risco, maior a variação de preço (para cima ou para baixo).
- **Diversificação**: o Professor Coruja explica que espalhar o dinheiro entre várias empresas reduz o risco de perder tudo de uma vez.
- **Liquidez**: a Loja só aceita dinheiro da carteira (`cash`), não da poupança ou das ações — para gastar dinheiro guardado, é preciso sacar ou vender antes.
