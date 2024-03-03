import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import axios from "axios"
import Loader from '../../components/Loader'


const DeletePost = ({postID: id}) => {

  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  
  const {currentUser} = useContext(UserContext)
  const token = currentUser?.token

  // Redirecione para login qualquer usuário q ñ esteja logado
  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [])

  const removePost = async () => {
    setIsLoading(true)
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
      if (response.status == 200) {
        if (location.pathname == `/myposts/${currentUser.id}`) {
          navigate(0)
        } else {
          navigate('/')
        }
      }
      setIsLoading(false)
    } catch (error) {
      console.log("Falha ao excluir post.")
    }
  }

  if (isLoading) {
    return <Loader />
  }
    
  return (
    <Link className='btn sm danger' onClick={() => removePost(id)}>Delete</Link>
  )
}

export default DeletePost