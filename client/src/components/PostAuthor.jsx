import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import reactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'

import br from 'javascript-time-ago/locale/pt.json'
import en from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'
import ReactTimeAgo from 'react-time-ago'

TimeAgo.addDefaultLocale(br)
TimeAgo.addLocale(en)
TimeAgo.addLocale(ru)


const PostAuthor = ({authorID, createdAt}) => {
    
    
    const [author, setAuthor] = useState({})
    
    
    useEffect(() => {
        const getAuthor = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorID}`)
                setAuthor(response?.data)
            } catch (err) {
                console.log(err)
            }
        }

        getAuthor()
    }, [])

  return (
    <Link to={`/posts/users/${authorID}`} className='post__author'>
        <div className="post__author-avatar">
            <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${author?.avatar}`} alt="Avatar do perfil" />
        </div>
        <div className="post__author-details">
            <h5>{author?.name}</h5>
            <small><ReactTimeAgo date={new Date(createdAt)} locale='pt-BR'/></small>
        </div>
    </Link>
  )
}

export default PostAuthor