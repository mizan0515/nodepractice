async function updatePost(postId) {
  event.preventDefault()
  const url = `${baseUrl}/api/edit/${postId}`;  // baseUrl 사용
  console.log(url);
  const data = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
  };

  console.log("js started")  
  try {
    const response = await axios.put(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log("200 status")  
      window.location.href = `/detail/${postId}`; // 성공적으로 업데이트 후 상세 페이지로 리다이렉트
    } else {
      console.error('Update failed:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
