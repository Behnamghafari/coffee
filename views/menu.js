// menu.js - کد منوی سایدبار

function initializeMenu() {
document.querySelectorAll('div')[0].classList.add('col-9')

    // ایجاد ساختار HTML منو
    const menuHTML = `
        <nav id="sidebar">
    <link rel="stylesheet" href="menu.css">

            <div class="sidebar-header">
                <i class="fas fa-coffee logo-icon"></i>
                <h3 class="sidebar-text">کافی شاپ من</h3>
            </div>
            
            <ul class="list-unstyled components">
                <li>
                    <a href="dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt icon"></i>
                        <span class="sidebar-text">داشبورد</span>
                    </a>
                </li>
                <li>
                    <a href="users.html" class="nav-link">
                        <i class="fas fa-users icon"></i>
                        <span class="sidebar-text">لیست کاربران</span>
                    </a>
                </li>
                <li>
                    <a class="nav-link dropdown-toggle" href="#productSubmenu" data-toggle="collapse" aria-expanded="false">
                        <i class="fas fa-coffee icon"></i>
                        <span class="sidebar-text">محصولات</span>
                    </a>
                    <ul class="collapse list-unstyled" id="productSubmenu">
                        <li>
                            <a href="products.html" class="dropdown-item">
                                <i class="fas fa-list icon"></i>
                                <span class="sidebar-text">لیست محصولات</span>
                            </a>
                        </li>
                        <li>
                            <a href="newproduct.html" class="dropdown-item">
                                <i class="fas fa-plus-circle icon"></i>
                                <span class="sidebar-text">افزودن محصول</span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="orders.html" class="nav-link">
                        <i class="fas fa-shopping-cart icon"></i>
                        <span class="sidebar-text">لیست سفارشات</span>
                    </a>
                </li>
                <li>
                    <a href="#" class="nav-link" id="logoutBtn">
                        <i class="fas fa-sign-out-alt icon"></i>
                        <span class="sidebar-text">خروج</span>
                    </a>
                </li>
            </ul>
        </nav>
        
        <div class="sidebar-overlay"></div>
        
        <nav class="mobile-navbar d-lg-none">
            <a href="dashboard.html" class="nav-link">
                <i class="fas fa-tachometer-alt icon"></i>
                <span>داشبورد</span>
            </a>
            <a href="users.html" class="nav-link">
                <i class="fas fa-users icon"></i>
                <span>کاربران</span>
            </a>
            <a href="products.html" class="nav-link">
                <i class="fas fa-coffee icon"></i>
                <span>محصولات</span>
            </a>
            <a href="orders.html" class="nav-link">
                <i class="fas fa-shopping-cart icon"></i>
                <span>سفارشات</span>
            </a>
        </nav>
    `;
    
    // اضافه کردن منو به بدنه صفحه
    $('body').prepend(menuHTML);
    
    // مقداردهی اولیه سایدبار
    function initSidebar() {
        if ($(window).width() <= 992) {
            alert("mobile")
document.querySelectorAll('div')[0].style = "margin-right: -20px;"

            $('#sidebar').removeClass('collapsed').addClass('show');
            closeSidebar();
        } else {
            $('#sidebar').removeClass('collapsed').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
        }
    }
    
    // توابع مدیریت سایدبار
    function toggleSidebar() {
        if ($(window).width() <= 992) {
document.querySelectorAll('div')[0].classList.add('col-12')

// document.querySelectorAll('div')[0].style = "margin-right: 10px;"

            if ($('#sidebar').hasClass('show')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        } else {
            $('#sidebar').toggleClass('collapsed');
            $('.sidebar-header h3').toggleClass('d-none');
            $('.sidebar-text').toggleClass('d-none');
            $('.nav-link').toggleClass('justify-content-center');
        }
    }
    
    function openSidebar() {
        $('#sidebar').addClass('show');
        $('.sidebar-overlay').addClass('active');
        $('body').css('overflow', 'hidden');
    }
    
    function closeSidebar() {
        $('#sidebar').removeClass('show');
        $('.sidebar-overlay').removeClass('active');
        $('body').css('overflow', 'auto');
    }
    
    // رویدادهای کلیک
    $('#sidebarCollapse').on('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    $('.sidebar-overlay').on('click', function() {
        closeSidebar();
    });
    
    if ($(window).width() <= 992) {
        $('#content').on('click', function() {
            closeSidebar();
        });
    }
    
    // هایلایت منوی فعال
    function highlightActiveMenu() {
        const currentPage = window.location.pathname.split('/').pop();
        $('.nav-link').removeClass('active');
        
        $('.nav-link').each(function() {
            const linkHref = $(this).attr('href');
            if (linkHref === currentPage) {
                $(this).addClass('active');
            }
        });
    }
    
    // مدیریت خروج
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    // رویداد تغییر اندازه پنجره
    $(window).on('resize', function() {
        if ($(window).width() <= 992) {
document.querySelectorAll('div')[0].classList.add('col-12')
// alert('mobile')

            $('#sidebar').removeClass('collapsed');
            $('.sidebar-header h3').removeClass('d-none');
            $('.sidebar-text').removeClass('d-none');
            $('.nav-link').removeClass('justify-content-center');
            $('#content').css('margin-right', '0');
            closeSidebar();
        } else {
document.querySelectorAll('div')[0].classList.add('col-9')


            $('#sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
            $('#content').css('margin-right', 'var(--sidebar-width)');
            $('body').css('overflow', 'auto');
        }
    });
    
    // مقداردهی اولیه
    initSidebar();
    highlightActiveMenu();
}

// فراخوانی تابع هنگام بارگذاری صفحه
$(document).ready(function() {
    initializeMenu();
});
