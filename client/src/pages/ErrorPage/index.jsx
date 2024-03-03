import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <section className='error-page'>
      <div className="center">
        <Link to="/" className='btn primary'>Voltar Para Página Inicial</Link>
        <h2>Página Não encontrada</h2>
      </div>
    </section>
  )
}

export default ErrorPage