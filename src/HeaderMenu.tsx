import './styles/header.css'

function HeaderMenu() {
    return (
      <nav className="header-menu">
        <b className="header-item header-title">Henry Snider</b>
        <div className="header-nav">
          <a className="header-item header-navitem" href="/">Home</a>
          <a className="header-item header-navitem" href="/flashcards">Flashcards</a>
        </div>
      </nav>
    );
}

export default HeaderMenu