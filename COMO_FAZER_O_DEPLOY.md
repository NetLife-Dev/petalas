# Guia de Deploy: Lançamento do Sistema Pétalas

Este guia contém as instruções finais para colocar o ecossistema **Pétalas** online usando o **Easypanel** ou qualquer serviço compatível com Docker.

## 🚀 Checklist Pré-Voo
O código já está configurado com `output: 'standalone'` e possui um `Dockerfile` otimizado para produção.

---

## Passo 1: Repositório GitHub
Certifique-se de que a última versão do código (que acabamos de finalizar) está no seu GitHub:
```bash
git add .
git commit -m "feat: migração completa para dados reais e localização pt-BR"
git push origin main
```

---

## Passo 2: Provisionamento no Easypanel
1. Crie um novo **Projeto** no Easypanel chamado `petalas`.
2. Adicione um serviço de **Banco de Dados PostgreSQL**.
3. Adicione um novo **App** de serviço.

---

## Passo 3: Variáveis de Ambiente (CRÍTICO)
No painel do seu Aplicativo, vá em **Environment** e configure:

| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | A URL de conexão do PostgreSQL que você criou no Passo 2. |
| `NEXTAUTH_SECRET` | Uma string aleatória longa para assinar os tokens de sessão. |
| `NEXTAUTH_URL` | A URL final onde o sistema ficará (ex: `https://app.petalas.io`). |
| `NANO_BANANA_API_KEY` | Sua chave de API para o motor de geração de vídeo. |

---

## Passo 4: Executando o Deploy
1. Na aba **Source**, conecte ao seu repositório GitHub.
2. Na aba **Build**, certifique-se de que o método selecionado é **Dockerfile**.
3. Clique em **Deploy**.

---

## Passo 5: Sincronização de Banco de Dados (Pós-Build)
Assim que o container estiver rodando, o banco de dados ainda estará vazio. Você precisa criar as tabelas reais:

1. Acesse o **Terminal**/Console do aplicativo dentro do Easypanel.
2. Execute o comando:
   ```bash
   npx prisma db push
   ```
3. (Opcional) Se quiser carregar dados iniciais de teste:
   ```bash
   npx prisma db seed
   ```

---

## ✅ Pronto!
Seu sistema **Pétalas** estará online e operando com dados 100% reais, sem mocks e totalmente localizado em português.

---
> [!TIP]
> Lembre-se de configurar o **SSL (HTTPS)** na aba **Domains** para garantir a segurança dos dados dos seus usuários.
