import React from 'react';
import { Alert, AlertTitle, Container, Link, Paper } from '@mui/material';

class Error extends React.Component {
  render() {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Paper>
          <Alert variant="outlined" severity="info">
            <AlertTitle>No User Found</AlertTitle>
            Please go to <Link href={window.location.href + '#/kyle'} underline="none" color='white'>{window.location.href}#/kyle</Link> for example
          </Alert>
        </Paper>
      </Container>
    );
  }
}

export default Error;