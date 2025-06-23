const groupBy = (array, key) => {
    return array.reduce((acc, item) => {
        const group = key(item);
        acc[group] = acc[group] || [];
        acc[group].push(item);
        return acc;
    }, {});
};

export { groupBy };
