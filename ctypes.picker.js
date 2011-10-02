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

	SetWindowText = user32dll.declare('SetWindowTextW', WinABI, BOOL, HWND, LPCTSTR)
}

Loaddlls()

var whnd, interval 
var antialias

startPicker = function(){
    var AdjustWindowRectEx = user32dll.declare('AdjustWindowRectEx', WinABI, BOOL,
    	ctypes.voidptr_t,DWORD, BOOL,DWORD
	);
    var w = 200, h = 200
    var cr = ctypes.int.array(4)([0,0,w,h])
    var dwExStyle = 392, dwStyle = 2496593920// GetWindowLong(h, -20)  GetWindowLong(h, -16)
    AdjustWindowRectEx(cr.address(), dwStyle, false, dwExStyle)
    w = cr[2]-cr[0]
    h = cr[3]-cr[1]
    
	whnd = CreateWindow(
		dwExStyle, "MozillaWindowClass", "hello r" , dwStyle,
		100, 100, w, h,
		0,0,0,null)
	ShowWindow(whnd, 8)
}
endPicker = function(){
    clearInterval(interval)
	DestroyWindow(whnd)
    whnd=null
}

/*
TextOut = gdi32dll.declare('TextOutW', WinABI, BOOL,
    	UINT, ctypes.int,ctypes.int, LPCTSTR,ctypes.int
	);
TextOut(pickerDC, 0,0, 'pop', 15)
*/
whnd&&endPicker()
startPicker()
#>>
t=Date.now()
SetWindowText(whnd, 'popdd\tpo')
t-Date.now()
#>>


function draw(){   
	var desktopDC = GetDC(0)
	var pickerDC = GetDC(whnd)

	SetStretchBltMode(pickerDC, z>1?0:4)
 cx=Math.floor(size.x/2-z*a.x-z/2), cy=Math.floor(size.y/2-z*a.y-z/2)
	StretchBlt(
        pickerDC, cx, cy, Math.floor(z*(1+2*a.x)),Math.floor(z*(1+2*a.y) ),
        desktopDC,p.x-a.x, p.y-a.y, 1+2*a.x, 1+2*a.y,
        0xCC0020
    )
    var cx = Math.floor(size.x/2-z/2),cy = Math.floor(size.y/2-z/2)
    var rec = ctypes.int.array(4)([cx,cy,cx+z,cy+z])
    FrameRect(pickerDC, rec, 0)
    
	ReleaseDC(0, desktopDC)
	ReleaseDC(whnd, pickerDC)
}


z=3

GetClientRect = user32dll.declare('GetClientRect', WinABI, BOOL, HWND, PVOID)
var cr = ctypes.int.array(4)()
var p=new POINT
 a={x:20,y:20}
 
function fullDraw(){
     t = Date.now()
    GetClientRect(whnd, cr.address())
    size={x:cr[2], y:cr[3]}

    a={x:Math.floor((size.x/z-1)/2), y:Math.floor((size.y/z-1)/2)}
    
    GetCursorPos(p.address())
    
    draw()
    return t-Date.now()
}
clearInterval(interval)
interval=setInterval(fullDraw,100)

#>>

a
#>>

var rec = ctypes.int.array(4)([10,0,100,100])


    FillRect = user32dll.declare("FillRect", WinABI, ctypes.int, 
		UINT, ctypes.voidptr_t, UINT
	)
    FrameRect = user32dll.declare("FrameRect", WinABI, ctypes.int, 
		UINT, ctypes.voidptr_t, UINT
	)
    var pickerDC = GetDC(whnd)
    SetDCBrushColor(pickerDC, 0x00F11FFF)
    FillRect(pickerDC, rec, brush)
    
    var rec = ctypes.int.array(4)([20,20,40,40])
    FrameRect(pickerDC, rec, 0)
    var rec = ctypes.int.array(4)([20,10,40,11])
    FrameRect(pickerDC, rec, 0)
    
        ReleaseDC(whnd, pickerDC)


#>>
CreateSolidBrush = gdi32dll.declare("CreateSolidBrush", WinABI, UINT,  DWORD)
SelectObject = gdi32dll.declare("SelectObject", WinABI, UINT,  UINT)
DeleteObject = gdi32dll.declare("DeleteObject", WinABI, BOOL,  UINT)
GetStockObject = gdi32dll.declare("GetStockObject", WinABI, UINT,  UINT)
SetDCBrushColor = gdi32dll.declare("SetDCBrushColor", WinABI, UINT,  UINT, DWORD)
brush = GetStockObject(18)

//dc_Brush := 18
//brush = DllCall("GetStockObject",UInt,dc_Brush)
#>>
//0x00bbggrr
f=CreateSolidBrush(0x000000FF)
ctypes.uint32_t("0x000000FF")

#>>

h=WindowFromPoint(POINT(Math.max(window.screenX+1,0),Math.max(window.screenY+1,0)))

#>>
    GetWindowLong  = user32dll.declare('GetWindowLongW', WinABI, DWORD, HWND, ctypes.int)  
    SetWindowLong  = user32dll.declare('SetWindowLongW', WinABI, DWORD, HWND, ctypes.int, DWORD)  
    SetWindowPos  = user32dll.declare('SetWindowLongW', WinABI, BOOL,
        UINT, UINT, ctypes.int, ctypes.int, ctypes.int, ctypes.int, UINT)  
GetLastError = kernel32dll.declare("GetLastError", WinABI, DWORD )
SetWindowPos(whnd, 0, 10,10, 100,100, 0x4000)
GetLastError()
#>>

h=whnd
l=GetWindowLong(h, -16)
 if(GetWindowLong(h, -20) & 0x00000008){
     
 }
l | 8

l.toString(16)
DWORD('0x94cf0008')

SetWindowLong(h, -16, DWORD('0x94cf0008'))
#>>