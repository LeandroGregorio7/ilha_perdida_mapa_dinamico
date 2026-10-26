# Ilha Perdida — Mapa Interativo

Mapa escolar interativo para o trabalho de Geografia do 7º ano. O site combina uma ilha ilustrada em estilo isométrico, controles de camadas, zoom e movimento, pontos arrastáveis e comparação entre o dia normal e uma chuva simulada.

## O que aparece no mapa

A obra *A Ilha Perdida*, de Maria José Dupré, acompanha Henrique e Eduardo numa ilha do rio Paraíba do Sul, perto de Taubaté. Uma cheia afasta a canoa; Henrique encontra Simão, que vive numa gruta, enquanto Eduardo tenta construir uma jangada para voltar.

O desenho do mapa é esquemático: as posições são ilustrativas, a escala é fictícia e as coordenadas formam uma grade simples. A simulação de chuva por até 24 horas é um cenário didático pedido no trabalho. Não é um acontecimento do livro nem uma previsão real.

## Executar no computador

Instale Node.js e pnpm. Na pasta do projeto, execute:

```bash
pnpm install
pnpm dev
```

Para gerar a versão estática:

```bash
pnpm build
```

Os arquivos prontos ficam na pasta `dist/`.

## Publicar no GitHub Pages

O workflow em `.github/workflows/deploy-pages.yml` constrói o site e envia `dist/` ao GitHub Pages sempre que um commit chega à branch `main`. Em **Settings → Pages → Build and deployment**, use **GitHub Actions** como origem de publicação.

## Fontes de contexto do livro

- Fundação Roberto Marinho, material pedagógico *Percurso Livre — Leitura de A Ilha Perdida*: https://midia.frm.org.br/drupal/public/media/documento/2025-06/Percurso%20Livre_LP_Ilha%20Perdida_digital2022.pdf
- Leituras em Dia, ficha de *A ilha perdida*: https://leiturasemdia.com.br/works/a-ilha-perdida-maria-jose-dupre
- Leitor dos Sonhos, resenha de *A Ilha Perdida*: https://leitordossonhos.com/2023/03/20/resenha-a-ilha-perdida-maria-jose-dupre/
- Ática/Amazon Brasil, dados e apresentação editorial da edição: https://www.amazon.com.br/ilha-perdida-Maria-Jos%C3%A9-Dupr%C3%A9/dp/8508173458

O material pedagógico consultado descreve a autora, a ilha, os personagens e os principais espaços da narrativa. Quando a família enviar o exemplar exato usado pela turma, os detalhes poderão ser conferidos com ele.

## Licença e direitos autorais

O repositório fornecido já contém a licença AGPL-3.0. O aplicativo mantém essa licença, mostra um aviso e oferece um link para o arquivo `LICENSE` no rodapé. A obra *A Ilha Perdida* continua protegida por direitos autorais; o mapa usa um desenho original e um resumo curto, sem reproduzir páginas ou ilustrações do livro.
