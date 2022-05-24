const helper = {};

helper.isValidPassword = (email) => {
    if (
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(
            email
        )
    ) {
        return true;
    }
    return false;
};

export default helper
