async function updatePost(postId) {
    const url = `http://localhost:8080/posts/${postId}`;
    const data = {
      title: 'Updated Post Title',
      content: 'Updated content for the post',
    };
  
    try {
      const response = await axios.put(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }