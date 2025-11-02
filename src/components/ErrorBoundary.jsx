import React from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, info: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        // Save additional info
        this.setState({ info })
        // Also log to console
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box p={8}>
                    <Heading size="md" mb={4}>Se produjo un error en la aplicación</Heading>
                    <Text mb={4}>{String(this.state.error?.message || this.state.error)}</Text>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#fff', padding: 12, borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
                        {this.state.info?.componentStack}
                    </pre>
                    <Button mt={4} onClick={() => window.location.reload()}>Recargar</Button>
                </Box>
            )
        }
        return this.props.children
    }
}
