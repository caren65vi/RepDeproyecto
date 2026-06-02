import React from 'react'
import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footerInner">
                <div className="footerBrand">
                    <span className="footerAppName">IncidentesApp</span>
                    <span className="footerUniversity">Universidad de la Amazonia</span>
                </div>
                <p className="footerCopy">© 2026 IncidentesApp. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}

export default Footer
