import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import {
  Box,
  Button,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { getDesignTokens, inputsCustomizations } from './customTheme';

export default function Register() {
  const calculatedMode = 'light';
  const brandingDesignTokens = getDesignTokens(calculatedMode);

  const THEME = createTheme({
    ...brandingDesignTokens,
    palette: {
      ...brandingDesignTokens.palette,
      mode: calculatedMode,
    },
    components: {
      ...inputsCustomizations,
    },
  });

  const handleRegister = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const userData = {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
      confirmPassword: data.get('confirmPassword'),
    };

    console.log('Register data:', userData);

    // Aquí luego conectas Firebase o tu backend.
  };

  return (
    <AppProvider theme={THEME}>
      <Container maxWidth="xs">
        <Box
          component="form"
          onSubmit={handleRegister}
          noValidate
          sx={{
            marginTop: '4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Typography variant="h4" textAlign="center" fontWeight="bold">
            Crear cuenta
          </Typography>

          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Nombre"
              autoComplete="name"
            />

            <TextField
              required
              fullWidth
              id="email"
              name="email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
            />

            <TextField
              required
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
            />

            <TextField
              required
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              color="primary"
              variant="contained"
              size="large"
            >
              Registrarse
            </Button>
          </Stack>

          <Typography textAlign="center" variant="body2">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" underline="hover">
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Container>
    </AppProvider>
  );
}