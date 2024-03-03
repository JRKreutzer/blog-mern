import React, { useContext, useEffect, useState } from 'react'
import { DUMMY_POSTS } from '../../data'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import axios from 'axios'
import Loader from '../../components/Loader'
import DeletePost from '../DeletePost'

const Dashboard = () => {
  
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsloading] = useState(false)


  const {currentUser} = useContext(UserContext)
  const token = currentUser?.token

  // Redirecione para login qualquer usuário q ñ esteja logado
  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    const getPosts = async ()  => {
      setIsloading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/users/${currentUser.id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        setPosts(response.data)
      } catch (error) {
        
      }
      setIsloading(false)
    }
    getPosts()
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return (
    <section className='dashboard'>
      {
        posts.length ? 
        <div className="container dashboard__container">
          {
            posts.map(post => {
              return (
                <article key={post.id} className="dashboard__post">
                  <div className="dashboard__post-info">
                    <div className="dashboard__post-thumbnail">
                      <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${post.thumbnail}`} alt="" />
                    </div>
                    <h5>{post.title}</h5>
                  </div>
                  <div className="dashboard__post-actions">
                    <Link to={`/posts/${post._id}`} className='btn sm'>Vizualizar</Link>
                    <Link to={`/posts/${post._id}/edit`} className='btn sm primary'>Editar</Link>
                    <DeletePost postID={post._id} />
                  </div>
                </article>
              )
            })
          }
        </div> : <h2 className='center'>Você não possui nenhum post ainda.</h2>
      }
    </section>
  )
}

export default Dashboard