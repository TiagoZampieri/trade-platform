import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors());

// const accounts: any = [];
const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function isValidName(name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail(email: string) {
  return email.match(/^(.+)\@(.+)$/);
}

function isValidPassword(password: string) {
  if (password.length < 8) return false;
  if (!password.match(/\d+/)) return false;
  if (!password.match(/[a-z]+/)) return false;
  if (!password.match(/[A-Z]+/)) return false;
  return true;
}

app.post("/signup", async (req: Request, res: Response) => {
  const input = req.body;
  if (!isValidName(input.name)) {
    return res.status(422).json({
      error: "Invalid name"
    });
  }
  if (!isValidEmail(input.email)) {
    return res.status(422).json({
      error: "Invalid email"
    });
  }
  if (!validateCpf(input.document)) {
    return res.status(422).json({
      error: "Invalid document"
    });
  }
  if (!isValidPassword(input.password)) {
    return res.status(422).json({
      error: "Invalid password"
    });
  }
  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password
  }
  // accounts.push(account);
  await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.document, account.password]);
  res.json({
    accountId
  });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
  res.json(accountData);
});

app.post('/deposit', async (req: Request, res: Response) => {
  const input = req.body;
  const accounts = await connection.query(`select account_id from ccca.account where account_id = '${input.accountId}'`);
  if (!accounts?.length) {
    return res.status(422).json({
      error: 'Invalid account'
    })
  }
  if (input.assetId !== 'USD' && input.assetId !== 'BTC') {
    return res.status(422).json({
      error: 'Invalid asset'
    })
  }
  if (!input.quantity) {
    return res.status(422).json({
      error: 'Invalid quantity'
    });
  }
  await connection.query('insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)', [input.accountId, input.assetId, input.quantity])
  return res.send()
});


app.post('/withdraw', async (req: Request, res: Response) => {
  const input = req.body;
  const [accountData] = await connection.query('select * from ccca.account where account_id = $1', [input.accountId]);
  if (!accountData) return res.status(422).json({ error: 'Account does not exist' });
  if (input.assetId !== 'BTC' && input.assetId !== 'USD') {
    return res.status(422).json({ error: 'Invalid asset' });
  }

  const [accountAssetsData] = await connection.query('select * from ccca.account_asset where account_id = $1 and asset_id = $2', [input.accountId, input.assetId]);
  const currentQuantity = parseFloat(accountAssetsData?.quantity)
  console.log(accountAssetsData, currentQuantity)
  if (!accountAssetsData || currentQuantity < input.quantity) {
    return res.status(422).json({ error: "Insuficient funds" })
  }
  res.send();
})

app.listen(3000);