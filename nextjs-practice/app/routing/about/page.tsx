/* A plain static route OUTSIDE the (shop) group: /routing/about.
   Navigating here from /routing/products unmounts the shop layout, so its counter resets
   when you go back. Compare with Shop <-> Cart, which share that layout. */

const AboutPage = () => {
  return <h1>About</h1>
}

export default AboutPage;
