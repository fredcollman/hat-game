const Layout = ({ children }) => (
  <div className="wrapper center-h padding-m">
    <header className="debug center-text">
      <h1>The Hat Game</h1>
    </header>
    <main>{children}</main>
  </div>
);

export default Layout;
