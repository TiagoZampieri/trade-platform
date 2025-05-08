import { useState } from 'react'

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const confirm = async () => {
    const input = {
      name,
      email,
      document,
      password
    }

    const response = await fetch(
      'http://localhost:3000/signup',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(input)
      }
    )
    const output = await response.json();
    setMessage('success')
  }

  const fill = () => {
    setEmail('john.doe@gmail.com');
    setName('John Doe');
    setDocument('97456321558');
    setPassword('asdQWE123')
  }

  return (
    <>
      <p>hello world</p>
      <input className='input-name' type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <input className='input-email' type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className='input-document' type="text" value={document} onChange={(e) => setDocument(e.target.value)} />
      <input className='input-password' type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => fill()}>Fill</button>
      <button className='button-confirm' onClick={() => confirm()}>Submit</button>
      <span className='span-message'>{message}</span>
    </>
  )
}

export default App
