import './CTA.css';

export default function CTA() {
    return (
        <section className="cta">
            <div className="cta__inner">
                <h2 className="cta__title">¿Ves un problema en el campus?</h2>
                <p className="cta__subtitle">
                    Únete y ayuda a mejorar las instalaciones de la Universidad de la Amazonia.
                </p>
                <div className="cta__actions">
                    <a href="/register" className="cta__btn cta__btn--primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        Crear cuenta gratis
                    </a>
                    <a href="/login" className="cta__btn cta__btn--secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Ya tengo cuenta
                    </a>
                </div>
            </div>
        </section>
    );
}
