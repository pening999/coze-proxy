
// 移动端导航栏切换
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 992) {
        document.querySelector('.nav-links').classList.add('active');
    }
});

// 轮播图功能
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-item');

function showSlides() {
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    
    slides[slideIndex - 1].classList.add('active');
    setTimeout(showSlides, 2000); // 每5秒切换一次
}

// 页面加载时启动轮播
showSlides();



 // 获取元素
 const vrContainer = document.querySelector('.vr-container');
 const enterFullscreenButton = document.getElementById('enter-fullscreen');
 const exitFullscreenButton = document.getElementById('exit-fullscreen');
 
 // 进入全屏
 enterFullscreenButton.addEventListener('click', function() {
     if (vrContainer.requestFullscreen) {
         vrContainer.requestFullscreen();
     } else if (vrContainer.mozRequestFullScreen) { // Firefox
         vrContainer.mozRequestFullScreen();
     } else if (vrContainer.webkitRequestFullscreen) { // Chrome, Safari, Opera
         vrContainer.webkitRequestFullscreen();
     } else if (vrContainer.msRequestFullscreen) { // IE/Edge
         vrContainer.msRequestFullscreen();
     }
 });
 
 // 退出全屏
 exitFullscreenButton.addEventListener('click', function() {
     if (document.exitFullscreen) {
         document.exitFullscreen();
     } else if (document.mozCancelFullScreen) { // Firefox
         document.mozCancelFullScreen();
     } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
         document.webkitExitFullscreen();
     } else if (document.msExitFullscreen) { // IE/Edge
         document.msExitFullscreen();
     }
 });
 
 // 监听全屏状态变化
 document.addEventListener('fullscreenchange', handleFullscreenChange);
 document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
 document.addEventListener('mozfullscreenchange', handleFullscreenChange);
 document.addEventListener('msfullscreenchange', handleFullscreenChange);
 
 function handleFullscreenChange() {
     if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
         // 当前处于全屏状态
         enterFullscreenButton.style.display = 'none';
         exitFullscreenButton.style.display = 'block';
     } else {
         // 当前退出全屏状态
         enterFullscreenButton.style.display = 'block';
         exitFullscreenButton.style.display = 'none';
     }
 }
 
  // 模拟从后端获取的用户名
            // 在实际应用中，这里应该通过AJAX请求或从会话中获取当前登录用户的用户名
            const currentUser = {
                username: '游客2356', // 这里应该是实际的用户名
                avatar: 'IMG/TX.jpg' // 这里应该是实际的头像URL
            };
    
            // 显示用户名
            document.getElementById('username').textContent = currentUser.username;
    
            // 如果有用户头像，更新头像
            if (currentUser.avatar) {
                document.querySelector('.user-avatar img').src = currentUser.avatar;
            }
            
            // 登出功能
            document.querySelector('.logout-btn').addEventListener('click', function() {
                // 在实际应用中，这里应该清除用户登录状态并跳转到登录页面
                alert('您已成功登出！');
                 window.location.href = 'index.html'; // 替换为您的登录页面URL
            });

