import { useToast } from "@chakra-ui/react";

type ToastStatus = "info" | "warning" | "success" | "error";

const useShowToast = () => {
  const toast = useToast();

  const showToast = (
    title: string,
    description: any,
    status: ToastStatus,
    id?: string,
  ) => {
    // Check if a toast with the given ID is already active
    if (id ? !toast.isActive(id) : !toast.isActive(status as string)) {
      toast({
        id, // Use the provided ID for the toast
        title: title,
        description: description,
        status: status,
        duration: 3000,
        isClosable: true,
        colorScheme: status === "success" ? "pink" : undefined,
      });
    }
  };

  return showToast;
};

export default useShowToast;
