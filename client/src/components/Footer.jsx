import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <ul className="footer__categories">
        <li>
          <Link to="/posts/categories/Agricultura">Agricultura</Link>
        </li>
        <li>
          <Link to="/posts/categories/Negócios">Negócios</Link>
        </li>
        <li>
          <Link to="/posts/categories/Educação">Educação</Link>
        </li>
        <li>
          <Link to="/posts/categories/Entreterimento">Entreterimento</Link>
        </li>
        <li>
          <Link to="/posts/categories/Artes">Artes</Link>
        </li>
        <li>
          <Link to="/posts/categories/Investimentos">Investimentos</Link>
        </li>
        <li>
          <Link to="/posts/categories/Sem categoria">Sem categoria</Link>
        </li>
        <li>
          <Link to="/posts/categories/Tempo">Tempo</Link>
        </li>
      </ul>
      <div className="footer__copyright">
        <small>All Rights Reserved &copy; Copyright, EGATOR Tutorials</small><br/>
        <small>José Rodolfo Kreutzer</small>
      </div>
    </footer>
  )
}

export default Footer