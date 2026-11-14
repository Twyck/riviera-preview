# Riviera Bar — experiência digital (prévia)

Site de uma página com narrativa conduzida pelo scroll para o Riviera Bar (Av. Paulista, 2584).
Stack: **Vite + JavaScript puro + GSAP (ScrollTrigger, SplitText) + Lenis**. Fontes hospedadas no projeto: Anton, Instrument Serif e Inter Tight.

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # gera dist/
npm run images    # regenera public/img a partir de assets-src/ (requer Python + Pillow)
npm run deploy    # publica a prévia no GitHub Pages (Twyck/riviera-preview)
```

A prévia está marcada como `noindex` e o `robots.txt` bloqueia buscadores. No lançamento oficial, remover os dois.

## Conceito: "Sempre abertos"
A identidade sai do cardápio oficial: vermelho Riviera (#EC1D26), papel quadriculado rosado, fotografia P&B com flash, tipografia condensada e cartuns colados como adesivos.
O site mostra a **hora de São Paulo ao vivo** e o status real da casa. Na 1ª segunda-feira do mês, dia de manutenção, a mensagem muda sozinha.

| # | Cena | Desktop | Mobile |
|---|---|---|---|
| 01 | Hero | "SEMPRE ABERTOS" gigante atrás e o recorte na frente; ao rolar, as palavras se abrem | Empilhado, com o mesmo efeito de abertura |
| 02 | Manifesto | Estrofes acendem na leitura; um traço sublinha "Estamos abertos." | Igual |
| 03 | História | Linha do tempo horizontal guiada pelo scroll vertical | Carrossel nativo de arrastar |
| 04 | Cozinha | Foto fixa que troca a cada categoria do cardápio | Foto acima de cada categoria |
| 05 | Pizzas | Nomes dos cartunistas deslizando em sentidos alternados | Igual |
| 06 | Drinks | Fotos em camadas com parallax e cartum colado | Empilhado |
| 07 | Visite | Relógio gigante ao vivo, endereço, regras de reserva | Igual |

Com `prefers-reduced-motion`, Lenis e as animações ficam desligados e o conteúdo aparece estático.

## Fontes do conteúdo (verificadas em 14/11/2026)
- **Instagram @rivierabarsp:** bio ("Desde 1949, ou desde sempre", "Sempre abertos | Bar 24h") e Linktree oficial (linktr.ee/sempreabertos).
- **Página de reservas oficial (Dionísio):** endereço, coordenadas, funcionamento 24h fechando só na 1ª segunda do mês e regras de reserva do Andar Superior.
- **Cardápio oficial (PDF no Linktree):** pratos, descrições, drinks, manifesto, fotos, cartuns e logo. **Preços foram omitidos de propósito**, porque mudam.
- **História:** ficha "Selo de Valor Cultural da Cidade de São Paulo" do Departamento do Patrimônio Histórico da Prefeitura (jan/2025). Dali saíram a fundação em 1949, a reabertura em 2013, o projeto de Márcio Kogan, o tombamento do Edifício Anchieta, os frequentadores, O Balão, Besame Mucho, a citação de Chico Buarque, a Fábrica de Bares e a reabertura em 2022.
- O bar **não tem site oficial**: o domínio rivierabar.com.br não responde.

## Imagens
Todas foram extraídas do cardápio oficial. As fotos estavam em CMYK invertido, o que é comum em PDFs do Adobe, e foram corrigidas. Os recortes usam as máscaras originais do arquivo.
**Para pedir ao cliente:** fotos coloridas do salão, do balcão vermelho e do letreiro em neon, além do logo em vetor (o atual foi renderizado do PDF em alta resolução).
