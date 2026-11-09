import './styles/header.css'

function HeaderMenu() {
    return (
      <nav className="header-menu">
        <b className="header-item header-title">Henry Snider</b>
        <div className="header-nav">
          <b className="header-item header-navitem">Home</b>
          <b className="header-item header-navitem">About</b>
          <b className="header-item header-navitem">Contact</b>
        </div>
      </nav>
    );
}

export default HeaderMenu