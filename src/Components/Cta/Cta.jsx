import './CTA.css';
import { useNavigate } from 'react-router-dom';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import Button from '../Button/Button';

export default function CTA() {
    const navigate = useNavigate();

    return (
        <section id="cta" className="cta">
            <div className="cta__inner">
                <h2 className="cta__title">¿Ves un problema en el campus?</h2>
                <p className="cta__subtitle">
                    Únete y ayuda a mejorar las instalaciones de la Universidad de la Amazonia.
                </p>
                <div className="cta__actions">
                    <Button
                        className="cta__btn cta__btn--primary"
                        startIcon={<PersonAddAltOutlinedIcon fontSize="small" />}
                        onClick={() => navigate('/register')}
                    >
                        Crear cuenta gratis
                    </Button>
                    <Button
                        className="cta__btn cta__btn--secondary"
                        startIcon={<LoginOutlinedIcon fontSize="small" />}
                        onClick={() => navigate('/login')}
                    >
                        Ya tengo cuenta
                    </Button>
                </div>
            </div>
        </section>
    );
}
