// TODO: add something to ensure snapshots are taken during headless mode - using 'cypress run' not 'cypress open'
// TODO: ensure all pages pull in fixture data?
// TODO: how to we run this on all pages? 

describe('visual regression tests', () => {
  it.only('should match previous screenshot "mundo home"', () => {
    // https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    cy.visit('http://localhost:7080/mundo');
    // TODO: scroll down the page to see if this makes all images load properly
    // cy.wait(2000); // images are not loading in properly - not sure why 
    cy.matchImageSnapshot();
  });
});
