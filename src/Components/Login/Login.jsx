import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { createTheme } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import { signIn as firebaseSignIn, signInGoogle,  onAuthChange, doSignOut } from '../../FireBase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../FireBase/config';

const providers = [
  { id: 'google', name: 'Google' },
  { id: 'credentials', name: 'Email and Password' },
];

const traducirError = (code) => {
  const errores = {
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/popup-closed-by-user': 'Se cerró la ventana antes de completar el acceso.',
    'auth/cancelled-popup-request': 'Operación cancelada.',
  };
  return errores[code] || 'Ocurrió un error. Intenta de nuevo.';
};

const Login = () => {
  const [sessionData, setSessionData] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);

  const THEME = createTheme({
    palette: { mode: 'light' },
  });

  React.useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        const userData = snap.exists()
          ? snap.data()
          : { rol: 'usuario', email: firebaseUser.email, nombre: firebaseUser.displayName };
        setSessionData({ user: firebaseUser, userData });
      } else {
        setSessionData(null);
      }
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (provider, formData) => {
    try {
      let result;
      if (provider.id === 'credentials') {
        const email = formData.get('email');
        const password = formData.get('password');
        result = await firebaseSignIn(email, password);
      } else if (provider.id === 'google') {
        result = await signInGoogle();
      }  else {
        return { error: 'Proveedor no soportado.' };
      }
      setSessionData(result);
      return {};
    } catch (err) {
      return { error: traducirError(err.code) };
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (sessionData) {
    // Aquí va tu dashboard según el rol
    return (
      <Box sx={{ p: 4 }}>
        <p>Bienvenido: {sessionData.userData?.nombre || sessionData.userData?.email}</p>
        <p>Rol: {sessionData.userData?.rol}</p>
        <button onClick={doSignOut}>Cerrar sesión</button>
      </Box>
    );
  }

  return (
    <AppProvider theme={THEME}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          form: { noValidate: true },
          submitButton: { color: 'primary', variant: 'contained' },
        }}
        sx={{
          '& form > .MuiStack-root': {
            marginTop: '2rem',
            rowGap: '0.5rem',
          },
        }}
      />
    </AppProvider>
  );
};

export default Login;
