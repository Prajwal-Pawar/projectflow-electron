import "../styles/about.css";

const About = () => {
  return (
    <div>
      <a href="/">
        <p className="back-link">Back to Home</p>
      </a>

      <div className="intro">
        <h2 className="greet">
          Hey i am
          <a href="https://github.com/Prajwal-Pawar" target="_blank">
            <span className="name"> Prajwal Pawar.</span>
          </a>
        </h2>
        <h3>MERN Stack developer, Linux and open source enthusiast</h3>
      </div>

      <p>
        I've been working on this project for quite some time now, Projectflow
        is agile project management tool which uses offline-first approach.{" "}
        <br />
        <span>Projectflow is built on ElectronJS and Reactjs</span>
      </p>
    </div>
  );
};

export default About;
