import { useToast } from '@chakra-ui/react'


export default function useNotifier () {

    const toast = useToast();

    return (title, description, status) => {

        toast({
            title,
            description,
            variant: 'left-accent',
            status,
            position: 'top-right',
            isClosable: true,
        });
    };
};
