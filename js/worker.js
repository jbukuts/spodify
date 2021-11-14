onmessage = (e)=>{

    var arr = new Array(e.data);
    console.group('[worker]');
    console.log('Data received from main thread: %i', arr[0]);
    console.groupEnd();
}