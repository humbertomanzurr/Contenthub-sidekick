import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Catch any render errors and show them clearly
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(e){ return{error:e}; }
  render(){
    if(this.state.error){
      return React.createElement('div',{style:{padding:40,fontFamily:'system-ui',color:'#DC2626',background:'#FFF'}},
        React.createElement('h2',null,'App Error'),
        React.createElement('pre',{style:{fontSize:12,whiteSpace:'pre-wrap'}}, 
          this.state.error?.message + '\n\n' + this.state.error?.stack
        )
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null,
    React.createElement(App)
  )
)
