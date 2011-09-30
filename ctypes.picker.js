Components.utils.import("resource://gre/modules/ctypes.jsm");  

var WM_COPYDATA = 74;
var PROCESS_QUERY_INFORMATION = 0x0400;
var PROCESS_VM_READ = 0x0010;
var CP_ACP = 0;

var DWORD = ctypes.uint32_t;
var UINT = ctypes.unsigned_int;
var BOOL = ctypes.bool;
var HANDLE = ctypes.size_t;
var HWND = HANDLE;
var HMODULE = HANDLE;
var WPARAM = ctypes.size_t;
var LPARAM = ctypes.size_t;
var LRESULT = ctypes.size_t;
var ULONG_PTR = ctypes.uintptr_t;
var PVOID = ctypes.voidptr_t;
var LPCTSTR = ctypes.jschar.ptr;
var LPCWSTR = ctypes.jschar.ptr;
var LPTSTR = ctypes.jschar.ptr;
var LPSTR = ctypes.char.ptr;
var LPCSTR = ctypes.char.ptr;
//var POINT = new ctypes.StructType("POINT", [{x: ctypes.long}, {y: ctypes.long}]);
var POINT = new ctypes.StructType("POINT", [{x: ctypes.int}, {y: ctypes.int}]);

var CallBackABI;
var WinABI;

if (ctypes.size_t.size == 8) {
    CallBackABI = ctypes.default_abi;
    WinABI = ctypes.default_abi;
} else {
    CallBackABI = ctypes.stdcall_abi;
	WinABI = ctypes.winapi_abi;
}
var EnumWindowsProc = ctypes.FunctionType(CallBackABI, BOOL, [HWND, LPARAM]);

UnLoaddlls = function() {
	user32dll.close();
	kernel32dll.close();
	gdi32dll.close();
}

Loaddlls = function() {
	user32dll = ctypes.open('user32.dll');
	kernel32dll = ctypes.open('kernel32.dll');
	gdi32dll = ctypes.open('gdi32.dll');

	FindWindow = user32dll.declare('FindWindowW', WinABI, HWND,   LPCTSTR, LPCTSTR);

	EnumWindows = user32dll.declare('EnumWindows', WinABI, BOOL,   EnumWindowsProc.ptr, LPARAM);
	EnumWindows = user32dll.declare('EnumChildWindows', WinABI, BOOL,   HWND, EnumWindowsProc.ptr, LPARAM);
	GetClassName = user32dll.declare('GetClassNameW', WinABI, ctypes.int,   HWND, LPTSTR, ctypes.int);
		
	GetCursorPos = user32dll.declare('GetCursorPos', WinABI, BOOL,   POINT.ptr);
	SetCursorPos = user32dll.declare('SetCursorPos', WinABI, BOOL,   ctypes.int32_t, ctypes.int32_t);
	WindowFromPoint = user32dll.declare('WindowFromPoint', WinABI, HWND,   POINT);
	ChildWindowFromPoint = user32dll.declare('ChildWindowFromPoint', WinABI, HWND,   HWND, POINT);

	// 
	GetDC = user32dll.declare("GetDC", WinABI ,UINT, UINT)
	ReleaseDC = user32dll.declare("ReleaseDC", WinABI ,ctypes.int ,UINT, UINT)
	StretchBlt = gdi32dll.declare("StretchBlt", WinABI, BOOL, 
		UINT, ctypes.int, ctypes.int,ctypes.int,ctypes.int, /*dest*/
		UINT, ctypes.int, ctypes.int,ctypes.int,ctypes.int, /*src*/
		UINT /**/
	)
	SetStretchBltMode = gdi32dll.declare("SetStretchBltMode", WinABI, BOOL, 
		UINT, ctypes.int
	)
	
	CreateWindow = user32dll.declare('CreateWindowExW', WinABI, HWND,
		DWORD,LPCTSTR,LPCTSTR,DWORD,
		ctypes.int,ctypes.int,ctypes.int,ctypes.int,
		HWND, ctypes.long,ctypes.long, ctypes.voidptr_t
	);
	ShowWindow = user32dll.declare('ShowWindow', WinABI, ctypes.long,
		ctypes.long,ctypes.long
	);
	DestroyWindow = user32dll.declare('DestroyWindow', WinABI, ctypes.long, HWND)

}

Loaddlls()

var h 
var antialias

startPicker = function(){
	h = CreateWindow(
		392, "MozillaWindowClass", "hello r" , 2496593920,// GetWindowLong(h, -20)  GetWindowLong(h, -16)
		100, 100, 200, 200,
		0,0,0,null)	
	ShowWindow(h, 8)
}
endPicker = function(){
	DestroyWindow(h)
    h=null
}

/*
TextOut = gdi32dll.declare('TextOutW', WinABI, BOOL,
    	UINT, ctypes.int,ctypes.int, LPCTSTR,ctypes.int
	);
TextOut(pickerDC, 0,0, 'pop', 15)
*/
h&&DestroyWindow(h)
startPicker()
#>>


function draw(){   
	var desktopDC = GetDC(0)
	var pickerDC = GetDC(h)

	SetStretchBltMode(pickerDC, 0)

	StretchBlt(
        pickerDC, Math.floor(size.x/2-z*a.x-z/2), Math.floor(size.y/2-z*a.y-z/2), z*(1+2*a.x),z*(1+2*a.y), 
        desktopDC,p.x-a.x, p.y-a.y, 1+2*a.x, 1+2*a.y,
        0xCC0020
    )

	ReleaseDC(0, desktopDC)
	ReleaseDC(h, pickerDC)
}


z=10

GetClientRect = user32dll.declare('GetClientRect', WinABI, BOOL, HWND, PVOID)
var cr = ctypes.int.array(4)()
var p=new POINT

#>>
function fullDraw(){
     t = Date.now()
    GetClientRect(h, cr.address())
    size={x:cr[2], y:cr[3]}

    a={x:5,y:5}
    
    GetCursorPos(p.address())
    
    draw()
    return t-Date.now()
}

i=setInterval(fullDraw,100)

clearInterval(i)

#>>
    //DllCall("GetClientRect" , "uint", hwnd, "uint", &rt)
