import React, { useState, useEffect } from 'react'
import './App.css';
import Post from './Post';
import { auth, db } from './firebase'
import { makeStyles } from '@material-ui/styles';
import { Button, Modal, Input } from '@mui/material';
//import { withTheme } from '@emotion/react';
import ImagePost from './ImagePost';
import axios from './axios';
import Pusher from 'pusher-js';



function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: 'white',
    //backgroundColor:white,
    // backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    //boxShadow: theme.shadows[5],
    //padding: theme.spacing(2, 4, 3),
    padding: '20px'
  },
}));


function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log(authUser);
        setUser(authUser);


      } else {
        setUser(null);
      }
    })
    return () => {
      unsubscribe();
    }
  }, [user, username]);
  const fetchPosts = async () =>
      await axios.get('/sync').then(response => {
        console.log(response);
        setPosts(response.data)
      })

  useEffect(() => {
    const pusher = new Pusher('a4f0d2ddf72417c330bc', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('posts');
    channel.bind('inserted', (data)=>{
      console.log('data received',data);
    fetchPosts();
    });

  }, [])


  useEffect(() => {

    
    fetchPosts();
  }, []);
  console.log('posts are >>>', posts);
  posts.forEach(post => {
    console.log('post>>>>', post);
  })




  const signUp = (event) => {
    event.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })

      .catch((error) => alert(error.message));
    setOpen(false);

  }
  const signIn = (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))
    setOpenSignIn(false);
  }

  return (
    <div className="App">

      {user?.displayName ? (

        <ImagePost username={user.displayName} />
      ) : (
        <h3>{ }</h3>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}

      >

        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup">
            

            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>



        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup">
            

            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>Sign In</Button>

          </form>

        </div>
      </Modal>



      <div className="app_header">
        <img
          className="app_headerimage"
          alt=""
        />
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
          <div className="app_loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
            <Button onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
        )}

      </div>



      <div className="app_posts">
        {
          posts.map((post) => (
            <Post
              user={user}

              key={post._id}
              postId={post._id}
              username={post.user}
              imageUrl={post.image}
            ></Post>

          ))
        }
      </div>


    </div>
  );
}

export default App;
