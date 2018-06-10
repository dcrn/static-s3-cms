import App from './components/App.svelte'

var app = new App({
  target: document.querySelector('main'),
  data: {
    name: 'world'
  }
});
