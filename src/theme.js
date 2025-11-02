import { extendTheme } from '@chakra-ui/react'

// Tema personalizado para Reynal-GYM
const theme = extendTheme({
  colors: {
    gym: {
      50: '#f0fff4',
      100: '#c6f6d5',
      200: '#9ae6b4',
      300: '#68d391',
      400: '#48bb78',
      500: '#38a169',
      600: '#2f855a',
      700: '#276749',
      800: '#22543d',
      900: '#1a202c',
    },
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'gym',
      },
      variants: {
        solid: {
          bg: 'gym.400',
          color: 'white',
          _hover: {
            bg: 'gym.500',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'gym.600',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'gym.400',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'gym.400',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme