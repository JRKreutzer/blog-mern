import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/Loader'

const Authors = () => {

  const [authors, setAuthors] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const getAuthors = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`)
        setAuthors(response?.data)
      } catch (err) {
        setError(err)
      }
      setIsLoading(false)
    }
    getAuthors()
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return (
    <section className="authors">
      {authors.length > 0 ?
        <div className="container authors__container">
          {
            authors.map(({_id: id, avatar, name, posts}, index) => {
              return (
                <Link key={index} to={`/posts/users/${id}`} className='author'>
                  <div className="author__avatar">
                    <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt={`Avatar do ${name}`} />
                  </div>
                  <div className="author__info">
                    <h4>{name}</h4>
                    <p>{posts}</p>
                  </div>
                </Link>
              )
            })
          }
        </div>
        : <h2 className='center'>Nenhum autor encontrado</h2>
      }
    </section>
  )
}

export default Authors