export function numberWithCommas(x = 0){
    return x === null ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function isInValid(x=''){
	return x?.trim()?.length < 1;
}

export function isInValidNum(x=0){
	console.log(x);
	console.log(isNaN(Number(x)) || x < 1);

	return isNaN(Number(x)) || x < 1;
}
