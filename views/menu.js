const body =  document.querySelector('body') ;
const head =  document.querySelector('head') ;
const  container = document.getElementsByClassName('container');


container.outerHTML =
`
           <!-- Top Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light mb-4">
            <div class="container-fluid">
                <button type="button" id="sidebarCollapse" class="btn btn-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                
                <div class="d-flex align-items-center">
                    <div class="user-profile">
                        <img src="https://via.placeholder.com/40" alt="User Profile">
                        <span id="usernameDisplay">مدیر سیستم</span>
                    </div>
                </div>
            </div>
        </nav>
        
    `

head.insertAdjacentHTML('beforeend',`
       <style>
        :root {
            --primary-color: #6f42c1;
            --secondary-color: #f8f9fa;
            --sidebar-width: 280px;
            --sidebar-collapsed-width: 80px;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            overflow-x: hidden;
        }
        
        /* Sidebar Styles */
        #sidebar {
            width: var(--sidebar-width);
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            background: linear-gradient(135deg, #6f42c1 0%, #4a1d96 100%);
            color: white;
            transition: all 0.3s;
            z-index: 1000;
            box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
        }
        
        #sidebar.collapsed {
            width: var(--sidebar-collapsed-width);
        }
        
        #sidebar.collapsed .sidebar-header h3,
        #sidebar.collapsed .sidebar-text,
        #sidebar.collapsed .dropdown-toggle::after {
            display: none;
        }
        
        #sidebar.collapsed .nav-link {
            justify-content: center;
        }
        
        .sidebar-header {
            padding: 20px;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
        }
        
        .sidebar-header h3 {
            margin-bottom: 0;
            margin-right: 10px;
            font-weight: 600;
        }
        
        .sidebar-header .logo-icon {
            font-size: 1.8rem;
        }
        
        .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: 15px 20px;
            display: flex;
            align-items: center;
            transition: all 0.3s;
        }
        
        .nav-link:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            text-decoration: none;
        }
        
        .nav-link.active {
            color: white;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .nav-link .icon {
            margin-left: 10px;
            font-size: 1.2rem;
            min-width: 20px;
            text-align: center;
        }
        
        .sidebar-text {
            font-weight: 500;
        }
        
        /* Dropdown Menu */
        .dropdown-menu {
            background-color: rgba(0, 0, 0, 0.2);
            border: none;
            margin: 0;
            padding: 0;
            width: 100%;
        }
        
        .dropdown-item {
            color: rgba(255, 255, 255, 0.8);
            padding: 10px 15px 10px 45px;
        }
        
        .dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .dropdown-toggle::after {
            margin-right: auto;
            margin-left: 10px;
            transition: transform 0.3s;
        }
        
        .dropdown.show .dropdown-toggle::after {
            transform: rotate(90deg);
        }
        
        /* Content Styles */
        #content {
            margin-right: var(--sidebar-width);
            padding: 20px;
            min-height: 100vh;
            transition: all 0.3s;
        }
        
        #sidebar.collapsed + #content {
            margin-right: var(--sidebar-collapsed-width);
        }
        
        .navbar {
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .navbar .btn-toggle {
            border: none;
            background: transparent;
            color: var(--primary-color);
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
        }
        
        .user-profile img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-left: 10px;
        }
        
        .card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
            transition: transform 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card-header {
            background-color: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            font-weight: 600;
            border-radius: 10px 10px 0 0 !important;
        }
        
        .stat-card {
            text-align: center;
            padding: 20px;
        }
        
        .stat-card .icon {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 15px;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .stat-card .label {
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .welcome-card {
            background: linear-gradient(135deg, #6f42c1 0%, #8e63d2 100%);
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .welcome-card h3 {
            font-weight: 600;
        }
        
        .welcome-card p {
            opacity: 0.9;
        }
        
        /* Product Table */
        .product-img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        /* Mobile Styles */
        .mobile-navbar {
            display: none;
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            background: linear-gradient(135deg, #6f42c1 0%, #4a1d96 100%);
            z-index: 1000;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .mobile-navbar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: 10px;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .mobile-navbar .nav-link.active {
            color: white;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .mobile-navbar .icon {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
        
        /* Responsive */
        @media (max-width: 992px) {
            #sidebar {
                width: var(--sidebar-collapsed-width);
            }
            
            #sidebar .sidebar-header h3,
            #sidebar .sidebar-text,
            #sidebar .dropdown-toggle::after {
                display: none;
            }
            
            #sidebar .nav-link {
                justify-content: center;
                padding: 15px 10px;
            }
            
            #content {
                margin-right: var(--sidebar-collapsed-width);
                padding-bottom: 60px;
            }
            
            #sidebar.collapsed {
                width: 0;
            }
            
            #sidebar.collapsed + #content {
                margin-right: 0;
            }
            
            .mobile-navbar {
                display: flex;
                justify-content: space-around;
            }
            
            .stat-card .value {
                font-size: 1.5rem;
            }
            
            .welcome-card h3 {
                font-size: 1.2rem;
            }
            
            .welcome-card p {
                font-size: 0.9rem;
            }
        }
        
        @media (max-width: 576px) {
            .stat-card {
                padding: 15px 10px;
            }
            
            .stat-card .icon {
                font-size: 1.8rem;
                margin-bottom: 10px;
            }
            
            .stat-card .value {
                font-size: 1.2rem;
            }
            
            .stat-card .label {
                font-size: 0.8rem;
            }
            
            .table-responsive {
                font-size: 0.8rem;
            }
            
            .action-btns .btn {
                padding: 5px;
                font-size: 0.7rem;
            }
        }
    </style>
    `)





body.insertAdjacentHTML('afterbegin',`
      <nav id="sidebar" class="animate-sidebar">
        <div class="sidebar-header">
            <i class="fas fa-coffee logo-icon"></i>
            <h3 class="sidebar-text">کافی شاپ من</h3>
        </div>
        
        <ul class="list-unstyled components">
            <li class="active">
                <a href="#" class="nav-link">
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
                        <a href="#" class="dropdown-item">
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
                <a href="#" class="nav-link">
                    <i class="fas fa-shopping-cart icon"></i>
                    <span class="sidebar-text">لیست سفارشات</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link">
                    <i class="fas fa-chart-line icon"></i>
                    <span class="sidebar-text">آمار و گزارشات</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link">
                    <i class="fas fa-cog icon"></i>
                    <span class="sidebar-text">تنظیمات</span>
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
    
    `)