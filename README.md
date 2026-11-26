# Vigamais

Telas de exemplo de um sistema para **construção civil e incorporadora** que junta, num só lugar, a obra e a venda: ERP, CRM e cotação de materiais feita por IA pelo WhatsApp.

**Ver funcionando:** https://rodscaloppe.github.io/vigamais/

> Isto é um protótipo de telas, não um sistema pronto. Todos os dados são de exemplo (obras, lojas, pessoas, preços e limites são fictícios). Não há servidor, banco de dados, WhatsApp nem IA de verdade por trás.

## A ideia

O projeto combina duas ideias:

- **Cotação autônoma de materiais**: a IA pede preço às lojas pelo WhatsApp, liga para quem não responde, compara as respostas e fecha o pedido dentro dos limites aprovados.
- **ERP e CRM com custo real**: lead que chega pelo WhatsApp ou por anúncio da Meta, funil de vendas, proposta travada pela margem, contratos e contabilidade.

O que liga as duas pontas:

```
compra fechada pela IA  →  custo da etapa da obra  →  margem de cada unidade  →  limite de desconto do corretor
```

Ou seja: o preço que a obra paga no cimento chega até a mesa de venda, e o corretor não consegue dar um desconto que derrube a margem mínima.

## As telas

### Painel

| Tela | O que mostra |
|---|---|
| [Painel da incorporadora](index.html) | Visão geral dos 3 empreendimentos: obra, vendas e caixa. |

### Obra

| Tela | O que mostra |
|---|---|
| [Obras e custos](obra.html) | Orçado × realizado por etapa, o que está faltando na obra, as cotações em andamento e exemplos das conversas no WhatsApp. |
| [Assistente de compras (IA)](assistente.html) | A IA vê a falta, pergunta ao engenheiro pelo WhatsApp, cota com as lojas e faz o pedido. Tem um campo “Pergunte ao assistente” que funciona. |
| [Suprimentos e cotações](suprimentos.html) | Comparativo das respostas das lojas e aprovação da compra. |
| [Planilha de cotações](planilha.html) | Memória de preços: guarda toda cotação, com o 1º e o 2º valor e a data de cada um, para não cotar de novo o que ainda vale. **Funciona.** |
| [Calculadora de materiais](calculadora.html) | Alvenaria, concreto, piso e pintura, com perdas. A lista já mostra o que tem preço válido na planilha. **Funciona.** |
| [Cesta de compras e curva ABC](cesta.html) | Testa todas as divisões de loja por item contando o frete, e classifica os itens em A, B e C. **Funciona.** |
| [Ranking de fornecedores](fornecedores.html) | Nota de 0 a 100 por loja (preço, resposta e volume), calculada a partir da planilha. **Funciona.** |
| [Diário de obra](diario.html) | O mestre responde 4 perguntas pelo WhatsApp e o diário alimenta o avanço físico e o estoque. |

### Vendas

| Tela | O que mostra |
|---|---|
| [Atendimento (WhatsApp)](atendimento.html) | Conversas abertas com leads, com a origem de cada um. |
| [Funil de vendas](funil.html) | Quadro com os leads por fase. |
| [Campanhas e origem dos leads](campanhas.html) | Do anúncio da Meta ao contrato, com a margem de cada venda. |
| [Espelho de vendas](espelho.html) | Mapa das unidades: vendidas, reservadas e disponíveis. |
| [Contratos e chaves](contratos.html) | Checklist de cada venda, do contrato à entrega das chaves. |

### Gestão

| Tela | O que mostra |
|---|---|
| [Financeiro e contabilidade](financeiro.html) | Contas e lançamentos gerados pelas compras e vendas, sem digitar de novo. |
| [Assistência técnica](assistencia.html) | Chamados das unidades já entregues. |

### Inteligência

| Tela | O que mostra |
|---|---|
| [Agentes de IA](agentes.html) | Vários agentes pequenos (obra, vendas, pós-compra), o que cada um pode e não pode fazer. |
| [Autonomia e travas da IA](autonomia.html) | Níveis de 0 a 3 por ação, as travas, os limites em dinheiro e o modo ensaio. |
| [Ideias e próximos passos](ideias.html) | 26 ideias com exemplo, origem e tamanho, uma ordem sugerida e as decisões que cabem à diretoria. |

## O que funciona de verdade

Quatro telas fazem conta no navegador: **planilha**, **calculadora**, **cesta** e **ranking**, além do campo de pergunta do **assistente**. Elas leem a mesma memória de preços (`planilha-dados.js`), então um preço lançado na planilha aparece nas outras.

Os dados ficam salvos só no navegador de quem está usando (`localStorage`). Nada é enviado para lugar nenhum, e cada pessoa vê a sua própria cópia. O botão de restaurar o exemplo, na planilha, volta tudo ao início.

As demais telas são estáticas: mostram como o sistema ficaria, sem interação.

## Como abrir

- **Pela internet:** https://rodscaloppe.github.io/vigamais/
- **No computador:** baixe a pasta e abra o `index.html` no navegador. Não precisa instalar nada.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `*.html` | As 19 telas. |
| `estilo.css` | O visual de todas as telas. |
| `menu.js` | Monta o menu lateral em todas as telas. |
| `planilha-dados.js` | Memória de preços compartilhada e os dados de exemplo. |

Sem dependências externas: HTML, CSS e JavaScript puros.

## Regras usadas nos exemplos

São valores ilustrativos, para a diretoria ajustar:

- Engenheiro aprova compras de até R$ 50.000,00; acima disso vai para a diretoria.
- Pedido mais de 10% acima da quantidade orçada também vai para a diretoria.
- Mínimo de 3 respostas de lojas por cotação; depois de 20 minutos sem resposta, a IA liga.
- Preço cotado vale 15 dias.
- Margem mínima de 23% por unidade e desconto do corretor limitado a 5%.
