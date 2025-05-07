import axios from "axios";

axios.defaults.validateStatus = () => true;
const url = 'http://localhost:3000';

test("Deve criar uma conta válida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(outputSignup.accountId).toBeDefined();
  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;
  expect(outputGetAccount.name).toBe(inputSignup.name);
  expect(outputGetAccount.email).toBe(inputSignup.email);
  expect(outputGetAccount.document).toBe(inputSignup.document);
});

test("Não deve criar uma conta com nome inválido", async () => {
  const inputSignup = {
    name: "John",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(responseSignup.status).toBe(422);
  expect(outputSignup.error).toBe("Invalid name");
});

test("Não deve criar uma conta com email inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(responseSignup.status).toBe(422);
  expect(outputSignup.error).toBe("Invalid email");
});

test.each([
  "111",
  "abc",
  "7897897897"
])("Não deve criar uma conta com cpf inválido", async (document: string) => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document,
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(responseSignup.status).toBe(422);
  expect(outputSignup.error).toBe("Invalid document");
});

test("Não deve criar uma conta com senha inválida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(responseSignup.status).toBe(422);
  expect(outputSignup.error).toBe("Invalid password");
});

test('Não deve realizar um saque em uma conta inexistente', async () => {
  const input = {
    accountId: crypto.randomUUID(),
    assetId: 'BTC',
    quantity: 20
  }
  const response = await axios.post(`${url}/withdraw`, input);
  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Account does not exist');
});

test('Não deve realizar um saque de um assetId inválido', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BRL',
    quantity: 20
  }
  const response = await axios.post(`${url}/withdraw`, input);
  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Invalid asset');
});

test('Não deve realizar um saque de um valor maior do que o saldo', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 120
  }
  const response = await axios.post(`${url}/withdraw`, input);
  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Insuficient funds');
});

test('Deve realizar um saque', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const inputDeposit = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 100
  }
  await axios.post(`${url}/deposit`, inputDeposit);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 20
  }
  const response = await axios.post(`${url}/withdraw`, input);
  console.log(response.data.error)
  expect(response.status).toBe(200);
});


test('Deve realizar um depósito', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 100
  }
  const responseDeposit = await axios.post(`${url}/deposit`, input);
  expect(responseDeposit.status).toBe(200)
});

test('Não deve realizar um depósito em uma conta inexistente', async () => {
  const input = {
    accountId: crypto.randomUUID(),
    assetId: 'BTC',
    quantity: 100
  };
  const responseDeposit = await axios.post(`${url}/deposit`, input);
  const outputDeposit = responseDeposit.data;
  expect(responseDeposit.status).toBe(422)
  expect(outputDeposit.error).toBe('Invalid account');
})

test('Não deve realizar um depósito com um asset inválido', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BRL',
    quantity: 100
  };
  const responseDeposit = await axios.post(`${url}/deposit`, input);
  const outputDeposit = responseDeposit.data;
  expect(responseDeposit.status).toBe(422)
  expect(outputDeposit.error).toBe('Invalid asset');
});

test('Não deve realizar um depósito com quantidade menor ou igual zero', async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  }
  const responseSignup = await axios.post(`${url}/signup`, inputSignup);
  const input = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 0
  };
  const responseDeposit = await axios.post(`${url}/deposit`, input);
  const outputDeposit = responseDeposit.data;
  expect(responseDeposit.status).toBe(422)
  expect(outputDeposit.error).toBe('Invalid quantity');
});